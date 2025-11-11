"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { ca, is } from "zod/locales"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "./FormField"
import { useRouter } from "next/navigation"
import { create } from "domain"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"

const authFormSchema = (type:FormType)=>{
  return z.object({
    name: type === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).max(50),
  })
}

const AuthForm = ({type}:{type : FormType}) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  // 1. define your form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  // 2. define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>){
    try{
      if(type==='sign-up'){
        const {name, email, password} = values;

        // create user with Firebase client SDK (this also signs in the client)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        })

        if(!result?.success){
          toast.error(result?.message);
          return;
        }

        // Exchange the newly created user's ID token with the server to create a session cookie
        try {
          const idToken = await userCredential.user.getIdToken();
          if (idToken) {
            const signInResult = await signIn({ email, idToken });
            if (!signInResult?.success) {
              // If server-side session creation failed, send user to sign-in page
              toast.success("Account created. Please sign in.");
              router.push("/sign-in");
              return;
            }
          }
        } catch (err) {
          // If exchanging token fails, continue but redirect to sign-in so user can authenticate
          console.error("Failed to create server session after signup:", err);
          toast.success("Account created. Please sign in.");
          router.push("/sign-in");
          return;
        }

        // sign up + server session succeeded
        toast.success("Account created successfully!");
        router.push("/");
      } else {
        //sign in logic
        const {email, password} = values;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        if(!idToken){
          toast.error("sign in failed");
          return;
        }

        await signIn({
          email, idToken
        });

        toast.success("Signed in successfully!");
        router.push("/");
      }
    }catch(error){
      console.log("error", error);
      toast.error(`There is an error: ${error}`);
    }
  }

  const isSignIn =type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>
        <h2>Practice job interview with AI</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (<FormField control={form.control} name="name" label="Name" placeholder="Your Name" type="text" />)}
            <FormField control={form.control} name="email" label="Email" placeholder="Your Email" type="email" />
            <FormField control={form.control} name="password" label="Password" placeholder="Your Password" type="password" />
            <Button className="btn" type="submit">{isSignIn ? "Sign In" : "Create an account"}</Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No account Yet " : "Already have an account already? "}
          <Link href={!isSignIn ? "/sign-in" : "/sign-up"} className="font-bold text-user-primary ml-1 ">
            {isSignIn ? "Create an account" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthForm