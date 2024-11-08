import { Link, useNavigate } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import {
  FaShoppingCart,
  FaSearch,
  FaSignInAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState } from "react";
const user = { _id: "gh", role: "admin" };

const Header = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();


const logoutHandler =()=>{
      setIsOpen(false);
      
}

  return (
    <nav className="header">
      <Link to={"/"} onClick={() => setIsOpen(false)}>
       <IoHome/>
      </Link>
      <Link to={"/cart"} onClick={() => setIsOpen(false)}>
        <FaShoppingCart />
      </Link>
      <Link to={"/search"} onClick={() => setIsOpen(false)}>
        <FaSearch />
      </Link>

      {user?._id ? (
        <>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <FaUser />
          </button>
          <dialog open={isOpen}>
            <div>
              {user?.role === "admin" && (
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                  Admin
                </Link>
              )}
              <Link to="/orders" onClick={() => setIsOpen(false)}>
                Order
              </Link>

              <button onClick={logoutHandler}>
                <FaSignOutAlt />
              </button>
            </div>
          </dialog>
        </>
      ) : (
        <button onClick={() => navigate("/login")}>
          <FaSignInAlt />
        </button>
      )}
    </nav>
  );
};

export default Header;
