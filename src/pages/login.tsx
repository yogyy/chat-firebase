import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Button } from "@headlessui/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser !== null) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { email, password } = Object.fromEntries(formData) as {
      email: string;
      password: string;
    };

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh w-dvw bg-[#0b121580]">
      <div className="flex w-full flex-col items-center justify-center gap-5 backdrop-blur-[19px] lg:w-1/2">
        <div className="flex w-full max-w-[90%] flex-1 flex-col items-center justify-center gap-5 lg:max-w-[50%]">
          <h2>Welcome back,</h2>
          <form onSubmit={handleLogin} className="flex w-full flex-col gap-5">
            <input
              type="text"
              placeholder="Email"
              name="email"
              className="w-full rounded-lg bg-[#11192890] p-3"
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className="w-full rounded-lg bg-[#11192890] p-3"
            />
            <Button
              className="w-full rounded-lg bg-[#111928] p-2.5 px-3"
              disabled={loading}
            >
              Sign In
            </Button>
          </form>
          <div className="flex gap-2 [&>a]:text-sky-500">
            <p>New to ChatZzz?</p>
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
