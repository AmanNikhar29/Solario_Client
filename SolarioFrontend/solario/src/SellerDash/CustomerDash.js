// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./Seller.css"; // Import the CSS file

// const CustomerDashboard = () => {
//   const [sellers, setSellers] = useState([]);

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/getSeller") // Fetch all sellers
//       .then((response) => {
//         setSellers(response.data.sellers);
//       })
//       .catch((error) => {
//         console.error("Error fetching sellers:", error);
//       });
//   }, []);

//   return (
//     <div className="customer-dashboard">
//       <h1 className="dashboard-title">Customer Dashboard</h1>
//       <div className="sellers-container">
//         {sellers.length > 0 ? (
//           sellers.map((seller, index) => (
//             <div key={index} className="seller-card">
//               <h2 className="seller-name">{seller.store_name}</h2>
//               <p className="seller-address">{seller.store_address}</p>
//               {/* <p className="seller-location">
//                 📍 Latitude: {seller.latitude}, Longitude: {seller.longitude}
//               </p> */}
//             </div>
//           ))
//         ) : (
//           <p>No sellers found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Seller.css"; // Import the CSS file

const CustomerDashboard = () => {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/seller/getAllSellers")
  .then((response) => {
    setSellers(response.data.sellers);
  })
  .catch((error) => {
    console.error("Error fetching sellers:", error);
  });
  }, []);

  return (
    <div className="customer-dashboard">
      <h1 className="dashboard-title">Customer Dashboard</h1>
      <div className="sellers-container">
        {sellers.length > 0 ? (
          sellers.map((seller, index) => (
            <div key={index} className="seller-card">
              <h2 className="seller-name">{seller.store_name}</h2>
              <p className="seller-address">{seller.store_address}</p>
            </div>
          ))
        ) : (
          <p>No sellers found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;