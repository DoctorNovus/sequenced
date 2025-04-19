import DataContainer from "./(Layout)/DataContainer";
import { NavBar } from "./(Layout)/Nav/NavBar";

const Layout = () => {
  return (
    <div>
      <div id="absolute adder">
        <NavBar />
        <div>
          <div className="pb-40">
            <DataContainer />
          </div>
        </div>
      </div>
    </div >
  );
};

export default Layout;
