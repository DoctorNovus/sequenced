import DataContainer from "./(Layout)/DataContainer";
import { NavBar } from "./(Layout)/Nav/NavBar";

const Layout = () => {
  return (
    <div>
      <div id="absolute adder">
        <NavBar />
        <div>
          <div className="">
            <DataContainer />
          </div>
        </div>
      </div>
    </div >
  );
};

export default Layout;
