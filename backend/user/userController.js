/* ---------------- helpers ---------------- */
const emailIsValid = (e) => /\S+@\S+\.\S+/.test(String(e || ""));
const extractCleanPhone = (p) => String(p || "").replace(/\D/g, "");

      fullName: fullName.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      phone: phone,
      birthDate: parsedBirth,
      password: hashedPassword

      