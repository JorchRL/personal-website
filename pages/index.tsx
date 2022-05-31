import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import footerPic from "../public/bg.png";

const Home: NextPage = () => {
  return (
    <div >
      <h1 className="px-6 font-bold text-3xl mt-[60vh]">
        Jorge builds stuff with code
      </h1>

      <div className="bg-blue-500 flex justify-center my-10">
        <span className="text-white h-40">works</span>
      </div>

      <div className="px-6">

        <h2 className="pb-5 text-3xl">And <b>software</b> for your business</h2>

        <h3 className="pb-5 text-xl"><b>Jorge Romero.</b> Freelance software developer</h3>

        <p className="text-xs pb-5">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nisi consequatur quia accusamus illo similique, dolor consequuntur ratione provident molestias saepe.</p>

        <p className="text-xs pb-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur omnis ratione, hic quas ullam repudiandae.</p>

        <p className="text-xs pb-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ea neque possimus expedita quasi? Odio, natus.</p>

        <hr />

      </div>

    </div>
  );
};

export default Home;
