import React from "react";
import { SignOutWithGoogle } from "./firebase/firebase.config";
import { Image, Menu } from "semantic-ui-react";
import * as logo from "./images/RenegadeLogo_white_transparent.png";

const AppHeader = ({ currentuser }) => (
    <Menu borderless inverted className="no-print">
        <Menu.Item header>
            <a href="/">
                <Image src={logo} className="header-logo" />
            </a>
        </Menu.Item>
        <Menu.Menu position="right">
            <Menu.Item>
                <span title="Log off" className="avatar floated-right" onClick={SignOutWithGoogle}>
                    <Image src={currentuser.photoURL} className="cursored" avatar size="mini" verticalAlign="middle" spaced />
                    {currentuser.email}
                </span>
            </Menu.Item>
        </Menu.Menu>
    </Menu>
);

export default AppHeader;
