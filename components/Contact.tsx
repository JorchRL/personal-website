import Link from "next/link";
import Image from "next/image";

import twitterLogo from "../assets/icons/Twitter_black.png"
import linkedInLogo from "../assets/icons/LinkedIN.png"
import githubLogo from "../assets/icons/Social_icons_black.png"
import whatsappLogo from "../assets/icons/WhatsApp.png"

const Contact = () => {
    return (
        <div className="px-6 py-20">
            <h1 className="text-3xl font-bold pb-3">Talk to me.</h1>
            

            <ul className="flex justify-between pt-10 px-10">
                <li className="w-10 h-10 hover:scale-110 hover:cursor-pointer">
                    <Link href="https://twitter.com/jrlgs">
                        <Image className="" src={twitterLogo} />
                    </Link>
                </li>
                <li className="w-10 h-10 hover:scale-110 hover:cursor-pointer">
                    <Link href="https://linkedin.com/in/jorchrl">
                        <Image src={linkedInLogo} />
                    </Link>
                </li>
                <li className="w-10 h-10 hover:scale-110 hover:cursor-pointer">
                    <Link href="https://github.com/jorchrl">
                        <Image src={githubLogo} />
                    </Link>
                </li>
                <li className="w-10 h-10 hover:scale-110 hover:cursor-pointer">
                    <Link href="https://wa.me/527773369629">
                        <Image src={whatsappLogo} />
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Contact;
