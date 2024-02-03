import { Preferences } from "@capacitor/preferences";
import { useEffect, useReducer, useState } from "react";
import { ToDoItem } from "../components/todo/ToDoItem";
import ToDoAddMenu from "../components/menus/ToDoAddMenu";
import ToDoViewer from "../components/menus/ToDoViewer";
import ActiveCalendar from "../components/calendar/ActiveCalendar";

async function setObject(obj) {
  await Preferences.set({
    key: "todo",
    value: JSON.stringify({
      items: obj || [],
    }),
  });
}

async function getObject() {
  const ret = await Preferences.get({ key: "todo" });
  const items = JSON.parse(ret.value);
  return items;
}

const ToDo = () => {
  const [items, setItems] = useState([]);
  const [menuInactive, setMenuInactive] = useState(true);
  const [itemFullDetails, setItemFull] = useState(null);

  const addToList = (item) => {
    let newArr = [...items];
    newArr.push(item);
    setObject(newArr);
    setItems(newArr);
  };

  const updateList = (item) => {};

  const deleteFromList = (item) => {};

  function itemsReducer(utilItems, action) {
    switch (action.type) {
      case "add": {
        let newArr = Array.from(utilItems);
        newArr.push(action.info);
        setObject(newArr);
        return newArr;
      }

      case "update": {
        let tempArr;

        if (utilItems) {
          tempArr = [...utilItems];

          tempArr = tempArr.map((item, ind) => {
            let newItem = item;

            if (ind == action.info.index) newItem = action.info.item;

            return newItem;
          });

          setObject(tempArr);
        }

        return tempArr;
      }

      case "overwrite": {
        return action.info;
      }

      case "delete": {
        let tempArr;

        if (utilItems) {
          tempArr = [...utilItems];
          const deleted = tempArr.splice(
            tempArr.indexOf(action.info) || action.info.index,
            1
          );

          setObject(tempArr);

          return tempArr;
        }

        return tempArr;
      }
    }
  }

  useEffect(() => {
    (async () => {
      const ites = await getObject();
      setItems(ites.items);
    })();
  }, []);

  if (itemFullDetails)
    return <ToDoViewer item={itemFullDetails} setItemFull={setItemFull} />;

  return (
    <div className="w-full h-full bg-accent-black text-accent-white">
      <ToDoAddMenu
        menuInactive={menuInactive}
        setMenuInactive={setMenuInactive}
        addToList={addToList}
        count={items.length}
      />
      <div className="flex flex-col justify-between w-full h-full">
        <div className="flex flex-col items-center w-full h-full">
          <ActiveCalendar />
          <ul className="w-full h-[35em] gap-3 flex flex-col justify-start items-center overflow-y-scroll py-4">
            {items &&
              items.length > 0 &&
              items
                .sort((a, b) => a.date < b.date)
                .map((item, key) => (
                  <li key={key} className="w-[95%]">
                    <ToDoItem
                      item={item}
                      index={key}
                      updateList={updateList}
                      deleteFromList={deleteFromList}
                      setItemFull={setItemFull}
                    />
                  </li>
                ))}
            {(!items || items.length == 0) && (
              <div className="w-full text-blue-500 text-center">
                <h1 className="text-lg">To-Do List is Empty! Add Something!</h1>
              </div>
            )}
          </ul>
        </div>
        <div className="w-full h-16 flex justify-center items-center">
          <button
            onClick={async () => {
              setMenuInactive(false);
            }}
            className="flex text-center justify-center items-center w-10 h-10 text-3xl bg-blue-600 rounded-full text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToDo;
