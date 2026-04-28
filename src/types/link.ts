import {ReactElement, ReactNode} from "react";

type Link = {
    label: string;
    href: string;
    // note sure if ReactElement or ReactNode yet
    icon: ReactElement | ReactNode;
}

export default Link;