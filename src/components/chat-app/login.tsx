import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "@/lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);

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

      console.log("Account created! You can login now");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center gap-24">
      <div className="flex flex-1 flex-col items-center gap-5">
        <h2>Welcome back,</h2>
        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center gap-5"
        >
          <input
            type="text"
            placeholder="Email"
            name="email"
            className="rounded-md bg-[rgba(17,25,40,0.6)] p-5"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            className="rounded-md bg-[rgba(17,25,40,0.6)] p-5"
          />
          <button>Sign In</button>
        </form>
      </div>
      <div className="h-[80%] w-0.5 bg-[#dddddd35]"></div>
      <div className="flex flex-1 flex-col items-center gap-5">
        <h2 onClick={() => console.log(avatar)}>Create an Account</h2>
        <form
          onSubmit={handleRegister}
          className="flex flex-col items-center justify-center gap-5 [&>input]:rounded-md [&>input]:bg-[rgba(17,25,40,0.6)] [&>input]:p-5"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-12"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                  clipRule="evenodd"
                />
              </svg>
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
          <button disabled={loading}> Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
