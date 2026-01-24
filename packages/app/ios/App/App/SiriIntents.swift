import AppIntents
import Foundation
import Security

private let defaultApiBaseUrl = "https://api.sequenced.ottegi.com"

private let tokenService = "com.ottegi.sequenced.deviceToken"
private let tokenAccount = "siri"

private func loadDeviceToken() -> String? {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: tokenService,
        kSecAttrAccount as String: tokenAccount,
        kSecReturnData as String: true,
        kSecMatchLimit as String: kSecMatchLimitOne
    ]

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess, let data = item as? Data else { return nil }
    if let token = String(data: data, encoding: .utf8) {
        return token
    }
    return UserDefaults.standard.string(forKey: "siriDeviceToken")
}

private func buildRequest(path: String, method: String, body: [String: Any]? = nil) throws -> URLRequest {
    guard let url = URL(string: defaultApiBaseUrl + path) else {
        throw URLError(.badURL)
    }
    guard let apiKey = loadDeviceToken() else {
        throw NSError(domain: "Sequenced", code: 401, userInfo: [NSLocalizedDescriptionKey: "Missing Siri device token."])
    }
    var request = URLRequest(url: url)
    request.httpMethod = method
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
    if let body {
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
    }
    return request
}

private func fetchDueTasks() async throws -> [String] {
    let request = try buildRequest(path: "/task/overdue", method: "GET")
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
        throw NSError(domain: "Sequenced", code: 500, userInfo: [NSLocalizedDescriptionKey: "Unable to fetch due tasks."])
    }
    guard let json = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
        return []
    }
    return json.compactMap { $0["title"] as? String }
}

private func addTask(title: String) async throws {
    let body: [String: Any] = [
        "title": title,
        "date": ISO8601DateFormatter().string(from: Date()),
        "done": false
    ]
    let request = try buildRequest(path: "/task", method: "POST", body: body)
    let (_, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
        throw NSError(domain: "Sequenced", code: 500, userInfo: [NSLocalizedDescriptionKey: "Unable to add the task."])
    }
}

@available(iOS 16.0, *)
struct DueTasksIntent: AppIntent {
    static var title: LocalizedStringResource = "What tasks are due"
    static var description = IntentDescription("Get the list of overdue tasks from Sequenced.")

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let tasks = try await fetchDueTasks()
        if tasks.isEmpty {
            return .result(dialog: "You have no overdue tasks.")
        }
        let preview = tasks.prefix(3).joined(separator: ", ")
        let message = tasks.count <= 3
            ? "You have \(tasks.count) overdue tasks: \(preview)."
            : "You have \(tasks.count) overdue tasks. \(preview), and more."
        return .result(dialog: "\(message)")
    }
}

@available(iOS 16.0, *)
struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add task"
    static var description = IntentDescription("Add a new task in Sequenced.")

    @Parameter(title: "Title")
    var title: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return .result(dialog: "Please provide a task title.")
        }
        try await addTask(title: trimmed)
        return .result(dialog: "Added task \(trimmed).")
    }
}

@available(iOS 16.0, *)
struct SequencedShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: DueTasksIntent(),
            phrases: [
                "What tasks are due in \(.applicationName)",
                "What's due in \(.applicationName)"
            ]
        )
        AppShortcut(
            intent: AddTaskIntent(),
            phrases: [
                "Add a task in \(.applicationName)",
                "Add task in \(.applicationName)"
            ]
        )
    }
}
