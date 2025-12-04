import { Alert, Button, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from "axios";
import { updateStart, updateSuccess, updateFailure } from '../redux/user/userSlice';
import { useDispatch } from "react-redux";

export const DashProfile = () => {

  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [formData, setFormData] = useState({});

  const filePickerRef = useRef();
  const dispatch = useDispatch();

  // Cloudinary env variables
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // -------- Handle image select --------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageFileUploadError("Image must be less than 2MB");
      setImageFile(null);
      setImageFileUrl(null);
      return;
    }

    setImageFileUploadError(null);
    setImageFile(file);
    setImageFileUrl(URL.createObjectURL(file));
  };

  // -------- Auto upload on change --------
  useEffect(() => {
    if (imageFile) {
      // eslint-disable-next-line react-hooks/immutability
      uploadImage();
    }
  }, [imageFile]);

  // -------- Upload to Cloudinary --------
  const uploadImage = async () => {
    try {
      setImageFileUploading(true);
      setImageFileUploadError(null);
      setImageFileUploadProgress(0);

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setImageFileUploadProgress(progress);
          },
        }
      );
      if (res.data.secure_url) {
        setImageFileUrl(res.data.secure_url);
        setFormData({ ...formData, profilePicture: res.data.secure_url });
      } else {
        setImageFileUploadError("Upload failed");
      }
      setImageFileUploading(false);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setImageFileUploadError("Upload error");
      setImageFileUploading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes Made');
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image upload');
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message)
      }
      else {
        dispatch(updateSuccess(data))
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
      setUpdateUserError(error.message)
    }
  }
  // -------- Component UI (return) --------
  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />

        {/* Profile Image */}
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md rounded-full overflow-hidden"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileUploadProgress / 100
                    })`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className="rounded-full w-full h-full object-cover"
          />
        </div>

        {imageFileUploading && (
          <p className="text-center text-sm text-blue-500">Uploading Image...</p>
        )}

        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}

        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />

        <TextInput
          type="text"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />

        <TextInput type="password" id="password" placeholder="password" onChange={handleChange} />

        <Button
          className="bg-gradient-to-br from-purple-600 to-blue-500 text-white"
          type="submit"
        >
          Update
        </Button>
      </form>

      <div className="text-red-500 flex justify-between mt-5">
        <div className="flex gap-2 items-center">
          <MdDelete />
          <span>Delete Account</span>
        </div>

        <div className="flex gap-2 items-center">
          <FaArrowRight />
          <span>Sign Out</span>
        </div>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">{updateUserSuccess}</Alert>
      ) }
      {updateUserError && (
        <Alert color="failure" className="mt-5">{updateUserError}</Alert>
      ) }
    </div>
  );
};
