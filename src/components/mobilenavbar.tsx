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

export function SheetDemo() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className={styles.floatingButtonContainer}>
                    <Button variant="outline" className={styles.floatingButton}><CgMenuRightAlt />
                    </Button>
                </div>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Abhimanyu's Portfolio</SheetTitle>
                    <SheetDescription>
                        Robotics Engineer
                    </SheetDescription>
                </SheetHeader>
                <ul className="grid gap-4 py-4">
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/">Home</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/">Projects</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/">Blog/Publications</a>
                    </li>
                    <li className="grid grid-cols-4 items-center gap-4">
                        <a href="/">Contact</a>
                    </li>
                </ul>
                <SheetFooter>
                    <SheetClose asChild>
                        Open to Work
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
