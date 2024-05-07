import { Button } from "@/components/ui/button";
import { useState } from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import styles from './FloatingButton.module.css'; // Import your CSS file for additional styling
import { CgMenuRightAlt } from "react-icons/cg";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

export function SheetDemo() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className={styles.floatingButtonContainer}>
                    <Button variant="outline" className={styles.floatingButton}><CgMenuRightAlt /></Button>
                </div>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Abhimanyu's Portfolio</SheetTitle>
                    <SheetDescription>Robotics Engineer</SheetDescription>
                </SheetHeader>
                <ul className="grid gap-4 py-4">
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/">Home</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/files/Abhimanyu_Resume_v3.pdf">Resume</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/projects">Projects</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/blog">Blog/Publications</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        Contact
                        <ul>
                            <li className="grid grid-cols-4 items-center gap-4">
                                <a href="https://www.linkedin.com/in/abhimanyus1997">
                                    <FaLinkedin /> LinkedIn
                                </a>
                            </li>
                            <li className="grid grid-cols-4 items-center gap-4">
                                <a href="https://www.twitter.com/in/abhimanyus1997/">
                                    <FaTwitter /> Twitter
                                </a>
                            </li>
                            <li className="grid grid-cols-4 items-center gap-4">
                                <a href="https://github.com/abhimanyus1997">
                                    <FaGithub /> GitHub
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <SheetFooter>
                    <SheetClose asChild>Open to Work</SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
