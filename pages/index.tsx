import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import footerPic from "../public/imgs/IMG_1604.png";

const Home: NextPage = () => {
  return (
    <div className="container min-h-screen flex flex-col">
      <article className="flex-1 px-9 mt-10 flex justify-start items-center">
        <div className="container self-start">
          <h1 className="font-bold text-2xl">
            Hi! I'm Jorge and I build stuff with code.{" "}
          </h1>
          <p>My site is currently under construction. Hire me? </p>
        </div>
        <div className="container">
          <h2 className="pb-3">
            In the meantime, why not check out my blog on Hashnode?
          </h2>
          <button className=" text-white hover:text-blue-900 hover:bg-slate-300 font-bold bg-slate-500 rounded-full py-3 px-3">
            <a href="https://jorgerl.hashnode.dev">Jorch's Mini Blog</a>
          </button>
        </div>
      </article>
      <footer className="">
        <Image src={footerPic} layout="responsive" />
      </footer>
    </div>
  );
};

export default Home;
