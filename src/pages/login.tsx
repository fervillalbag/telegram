import React from "react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

type Inputs = {
  email: string;
  password: string;
};

type DataLogin = {
  email: string;
  password: string;
};

const login = async (info: DataLogin) => {
  const response = await axios({
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_API_URL}/api/user/login`,
    data: info,
  });

  return response.data;
};

export default function Login() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await login(data);
      localStorage.setItem("access_token", response?.access_token);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-3"
      >
        <div>
          <input
            className="p-3 rounded-md border border-neutral-500 w-full"
            placeholder="Email"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <span className="block mt-1 text-red-600">
              This field is required
            </span>
          )}
        </div>
        <div>
          <input
            type="password"
            className="p-3 rounded-md border border-neutral-500 w-full"
            placeholder="Password"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <span className="block mt-1 text-red-600">
              This field is required
            </span>
          )}
        </div>

        <button className="bg-neutral-800 text-white py-3 rounded-md">
          Ingresar
        </button>
      </form>
    </div>
  );
}
