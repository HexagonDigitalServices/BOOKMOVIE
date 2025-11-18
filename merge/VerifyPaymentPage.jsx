
      // Trim session_id to remove accidental whitespace
      const rawSession = params.get("session_id");
      const session_id = rawSession ? rawSession.trim() : null;
      const payment_status = params.get("payment_status");
      const token = localStorage.getItem("token");


      (err) {
        console.error("Verification error:", err);

        // show server message if present, but handle 404 specially
        const status = err?.response?.status;
        const serverMsg = err?.response?.data?.message;

        if (status === 404) {
          setStatusMsg(
            serverMsg ||
              "Payment session not found. If you were charged, contact support with your session id."
          );
        } else if (status === 400) {
          setStatusMsg(
            serverMsg || "Payment not completed or invalid request."
          );
        } else {
          setStatusMsg(
            serverMsg ||
              "There was an error confirming your payment. If you were charged, please contact support."
          );
        }
      }