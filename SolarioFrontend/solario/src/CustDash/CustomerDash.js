import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Customer.css";
import { 
  Drawer, 
  Badge, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  Snackbar,
  Alert 
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SendIcon from '@mui/icons-material/Send';

const CustomerDashboard = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();
  
  // Get customer data directly from localStorage
  const customerData = JSON.parse(localStorage.getItem('customer'));
  const customerId = customerData?.id;
  const customerName = customerData ? `${customerData.first_name} ${customerData.last_name}` : 'User';
  const customerEmail = customerData?.email || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sellers
        const sellersResponse = await axios.get("http://localhost:5000/api/seller/getAllSellers");
        setSellers(sellersResponse.data.sellers);
        
        // Fetch cart count if customer exists
        if (customerId) {
          const cartResponse = await axios.get(`http://localhost:5000/api/cart/count/${customerId}`);
          setCartItemsCount(cartResponse.data.count);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();

    // Check if location was previously enabled
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocationEnabled(true);
      setUserLocation(JSON.parse(savedLocation));
    }
  }, [customerId]);

  const handleSellerClick = (sellerId) => {
    localStorage.setItem('selectedSellerId', sellerId);
    navigate(`/Store/${sellerId}`);
  };

  const requestLocationAccess = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date(position.timestamp)
          };
          setUserLocation(location);
          setLocationEnabled(true);
          setLocationLoading(false);
          localStorage.setItem('userLocation', JSON.stringify(location));
        },
        (error) => {
          setLocationError("Unable to retrieve your location");
          setLocationLoading(false);
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser");
      setLocationLoading(false);
    }
  };

  const handleCartClick = () => {
    navigate('/Cart');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleFavourate = async () => {
    navigate('/Fav');
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (!confirmLogout) {
      return;
    }
    
    try {
      localStorage.removeItem('customer');
      localStorage.removeItem('userLocation');
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSendReportClick = (sellerId, e) => {
    e.stopPropagation();
    setSelectedSellerId(sellerId);
    setConfirmOpen(true);
  };

  const handleConfirmSendReport = async () => {
    if (!customerId || !selectedSellerId) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Customer ID or Seller ID is missing");
      setSnackbarOpen(true);
      setConfirmOpen(false);
      return;
    }

    try {
      setSendingReport(true);
      
      const response = await axios.post(
        "http://localhost:5001/api/sendReport/send-requirement-report",
        {
          customerId: customerId,
          sellerId: selectedSellerId
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        setSnackbarMessage(response.data.message || "Requirements successfully sent to seller");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage(response.data.message || "Failed to send requirements report");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error("Error sending report:", error);
      
      let errorMessage = "An error occurred while sending the report";
      if (error.response) {
        // Handle backend validation errors
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Validation error";
        } else if (error.response.status === 404) {
          errorMessage = error.response.data.message || "Customer or requirements not found";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - seller server took too long to respond";
      } else if (error.request) {
        errorMessage = "Seller server is not responding";
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
    } finally {
      setSendingReport(false);
      setConfirmOpen(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const filteredSellers = sellers.filter(seller =>
    seller.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Profile drawer content
  const profileDrawerContent = () => (
    <div className="profile-drawer">
      <div className="drawer-header">
        <button onClick={toggleDrawer(false)} className="close-drawer-btn">
          <CloseIcon />
        </button>
      </div>
      <div className="profile-content">
        <div className="profile-info">
          <AccountCircleIcon className="profile-icon" />
          <h3>{customerName}</h3>
          <p>{customerEmail}</p>
        </div>
        <Divider />
        <List>
          <ListItem button onClick={() => navigate('/orders')}>
            <ListItemIcon>
              <ShoppingBagIcon />
            </ListItemIcon>
            <ListItemText primary="My Orders" />
          </ListItem>
          <ListItem button onClick={() => navigate('/favorites')}>
            <ListItemIcon>
              <FavoriteIcon />
            </ListItemIcon>
            <ListItemText primary="Favorites" />
          </ListItem>
          <ListItem button onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </div>
    </div>
  );

  return (
    <div className="CustBack">
      <div className="customer-dashboard">
        {/* Navigation Header */}
        <div className="dashboard-nav">
          <div className="dashboard-header">
            <button className="profile-menu-button" onClick={toggleDrawer(true)}>
              <MenuIcon className="menu-icon" />
            </button>
            <h1 className="nav-title">Local Stores</h1>
            <div className="fav-icon-container">
              <FavoriteIcon className="fav-icon" onClick={handleFavourate} />
            </div>
            <div className="cart-icon-container" onClick={handleCartClick}>
              <Badge badgeContent={cartItemsCount} color="primary">
                <ShoppingCartIcon className="cart-icon" />
              </Badge>
            </div>
          </div>

          {/* Profile Drawer */}
          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={toggleDrawer(false)}
            PaperProps={{
              sx: {
                width: 300,
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            {profileDrawerContent()}
          </Drawer>

          <div className="location-controls">
            {locationEnabled ? (
              <div className="location-display">
                <span className="location-icon">📍</span>
                <span className="location-text">
                  {userLocation ? `Near you (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : "Location enabled"}
                </span>
              </div>
            ) : (
              <button 
                className="location-button"
                onClick={requestLocationAccess}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <span className="button-loading">
                    <span className="spinner"></span> Detecting...
                  </span>
                ) : (
                  <>
                    <span className="location-icon">📍</span>
                    Enable Location
                  </>
                )}
              </button>
            )}
            {locationError && (
              <div className="location-error">{locationError}</div>
            )}
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search stores or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <i className="search-icon">🔍</i>
          </div>
          <button onClick={() => navigate('/Report')} className="Report">Create Report</button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading stores...</p>
          </div>
        ) : (
          <div className="sellers-container">
            {filteredSellers.length > 0 ? (
              filteredSellers.map((seller, index) => {
                const storePhotos = seller.store_photos ? seller.store_photos.split(',') : [];
                const firstPhoto = storePhotos.length > 0 ? storePhotos[0].trim() : null;

                return (
                  <div 
                    key={index} 
                    className="seller-card"
                    onClick={() => handleSellerClick(seller.seller_id)}
                  >
                    <div className="image-container">
                      {firstPhoto ? (
                        <img 
                          src={`http://localhost:5000${firstPhoto.startsWith('/') ? '' : '/'}${firstPhoto}`}
                          alt={seller.store_name}
                          className="seller-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-store.png';
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <span>No Image Available</span>
                        </div>
                      )}
                    </div>
                    <div className="seller-info">
                      <h2 className="seller-name">{seller.store_name}</h2>
                      <p className="seller-address">
                        <span className="location-icon">📍</span> {seller.city}
                      </p>
                      <div className="rating-container">
                        <div className="stars">★★★★☆</div>
                        <span className="rating-text">4.2 (120)</span>
                      </div>
                      <div className="seller-actions">
                        <button className="view-store-btn">Visit Store</button>
                        <button 
                          className="send-report-btn"
                          onClick={(e) => handleSendReportClick(seller.seller_id, e)}
                        >
                          <SendIcon fontSize="small" /> Send Requirements
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <img src="/no-results.png" alt="No results" className="no-results-img" />
                <p className="no-results-text">No stores found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={handleCloseConfirm}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Send Requirements Report</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to send your requirements report to this store? 
              The store owner will receive all your saved requirements including:
              <ul>
                <li>Your budget</li>
                <li>Site category</li>
                <li>Area size</li>
                <li>Location preferences</li>
                <li>Any additional requirements</li>
              </ul>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirm} disabled={sendingReport}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSendReport} 
              disabled={sendingReport}
              color="primary"
              autoFocus
              startIcon={<SendIcon />}
            >
              {sendingReport ? 'Sending...' : 'Send Report'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default CustomerDashboard;