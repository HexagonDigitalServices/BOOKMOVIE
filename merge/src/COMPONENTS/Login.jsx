
localStorage.setItem(
            "cine_auth",
            JSON.stringify({
              isLoggedIn: true,
              email: userToStore.email || formData.email,
            })
          );
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem(
            "userEmail",
            userToStore.email || formData.email || ""
          );
          localStorage.setItem(
            "cine_user_email",
            userToStore.email || formData.email || ""
          );
          localStorage.setItem("user", JSON.stringify(userToStore));




catch (err) {
      console.error("Login error:", err);
      const serverMsg =
        err?.response?.data?.message || err?.message || "Server error";

      // Map common backend messages to specific UI responses
      const msgLower = String(serverMsg).toLowerCase();
      if (msgLower.includes("password") || msgLower.includes("invalid")) {
        toast.error(serverMsg);
      } else if (msgLower.includes("email")) {
        toast.error(serverMsg);
      } else {
        toast.error(serverMsg);
      }
    }