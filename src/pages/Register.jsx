import React, { useState } from "react";
import { useFirebase } from "../context/FirebaseContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      alert("Registro exitoso");
      navigate("/");
    } catch (error) {
      alert("Error al registrarse: " + error.message);
    }
  };

  return (
    <div className="pt-20 min-h-screen text-white">
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;
