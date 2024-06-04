import { db } from "@/lib/firestore";
import { UserType } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { doc, getDoc } from "firebase/firestore";

interface UserState {
  currentUser: UserType | null;
  isLoading: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserInfo.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchUserInfo.fulfilled, (state, action) => {
      state.currentUser = action.payload as UserType;
      state.isLoading = false;
    });
    builder.addCase(fetchUserInfo.rejected, (state) => {
      state.currentUser = null;
      state.isLoading = false;
    });
  },
});

export const fetchUserInfo = createAsyncThunk(
  "user/fetchUserInfo",
  async (uid?: string) => {
    if (!uid) {
      throw new Error("Missing user ID"); // Throw an error for missing ID
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data(); // Extract user data
        return userData; // Return the fetched user data
      } else {
        return null; // Return null if user not found
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },
);

export default userSlice.reducer;
