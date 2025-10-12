


  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



      // Persist auth to localStorage so Navbar detects logged-in state
      try {
        const authObj = { isLoggedIn: true, email: formData.email };
        localStorage.setItem('cine_auth', JSON.stringify(authObj));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email || '');
        localStorage.setItem('cine_user_email', formData.email || '');
        console.log('Auth saved to localStorage:', authObj);
      } 

    <div className={loginStyles.pageContainer}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
