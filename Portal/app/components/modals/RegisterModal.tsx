"use client";
import axios from "axios";
// Google and GitHub imports removed
import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useRegisterModal from "@/app/hooks/useRegisterModal";
// import { data } from "autoprefixer"; // Removed unused import
import Modal from "./Modals";
import Heading from "../Heading";
import Input from "../inputs/Input";
import { toast } from "react-hot-toast";
// import Button from "../NavBar/Button"; // Removed unused import
// import { SignatureKind } from "typescript"; // Removed unused import
// import { signIn } from "next-auth/react"; // Removed unused import
import useLoginModal from "@/app/hooks/useLoginModal";
const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [loginModal, registerModal]);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: { name: "", email: "", password: "" },
  });
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post("/api/register", data)
      .then((res) => {
        registerModal.onClose();
        toast.success("Account Created, Please Login to continue.");
      })
      .catch((err) => {
        toast.error("wrong.");
      });
    setIsLoading(false);
  };
  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Welcome to CCMS Portal" subtitle="Create your account to get started" center />
      <Input
        id="email"
        label="Email"
        type="email"
        register={register}
        disabled={isLoading}
        required
        errors={errors || {}}
      />{" "}
      <Input
        id="name"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );
  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div
        className="
        text-red-100 
        text-center 
        mt-4 
        font-light
      "
      >
        <p>
          Already have an account?
          <span
            onClick={onToggle}
            className="
            text-fuchsia-300 
            cursor-pointer 
            hover:underline
          "
          >
            {" "}
            Log in
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel="Continue"
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
