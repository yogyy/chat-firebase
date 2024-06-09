import { useEffect, useState } from "react";
import { toast } from "sonner";
import upload from "@/lib/upload";
import { auth, db } from "@/lib/firebase";
import { Button } from "@headlessui/react";
import { UserCircle } from "@/components/icons";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(avatar);
    if (avatar.url.length !== 0) {
      URL.revokeObjectURL(avatar.url);
      console.log("revoke", avatar.url);
    }

    if (e.target.files?.[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const { username, email, password } = Object.fromEntries(formData) as {
      username: string;
      email: string;
      password: string;
    };

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file as File, "profile");

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex h-dvh w-dvw bg-[#0b121580]">
      <div className="flex w-full flex-col items-center justify-center gap-5 backdrop-blur-[19px] lg:w-1/2">
        <h2>Create an Account</h2>
        <form
          onSubmit={handleRegister}
          className="flex w-full max-w-[90%] flex-col items-center justify-center gap-5 lg:max-w-[50%] [&>input]:w-full [&>input]:rounded-lg [&>input]:bg-[#11192890] [&>input]:p-3"
        >
          <label
            htmlFor="file"
            className="flex w-full cursor-pointer items-center justify-between underline"
          >
            {avatar.url ? (
              <img
                className="h-12 w-12 rounded-lg object-cover opacity-60"
                src={avatar.url}
              />
            ) : (
              <UserCircle className="size-12" />
            )}
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
            required
          />
          <input required type="text" placeholder="Username" name="username" />
          <input required type="text" placeholder="Email" name="email" />
          <input
            required
            type="password"
            placeholder="Password"
            name="password"
          />
          <Button
            className="w-full rounded-lg bg-[#111928] p-2.5 px-3"
            disabled={loading}
          >
            Sign Up
          </Button>
        </form>
        <div className="flex gap-2 [&>a]:text-sky-500">
          <p>Already have an account?</p>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
