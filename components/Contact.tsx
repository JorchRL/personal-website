import Link from "next/link";
import Image from "next/image";

import twitterLogo from "../assets/icons/Twitter_black.png"
import linkedInLogo from "../assets/icons/LinkedIN.png"
import githubLogo from "../assets/icons/Social_icons_black.png"
import whatsappLogo from "../assets/icons/WhatsApp.png"

const Contact = () => {
    return (
        <div className="">
            <h1 className="text-3xl font-bold">Talk to me.</h1>
            <h2 className="text-xl font-bold">hello@jrlgs.dev</h2>
            <ul className="flex">
                <li>
                    <Link href="https://twitter.com/jrlgs">
                        <Image src={twitterLogo} />
                    </Link>
                </li>
                <li>
                    <Link href="https://linkedin.com/in/jorchrl">
                        <Image src={linkedInLogo} />
                    </Link>
                </li>
                <li>
                    <Link href="https://github.com/jorchrl">
                        <Image src={githubLogo} />
                    </Link>
                </li>
                <li>
                    <Link href="https://wa.me/527773369629">
                        <Image src={whatsappLogo} />
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Contact;