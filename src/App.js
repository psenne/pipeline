import React, { Component } from "react";
import { fbUsersDB, fbauth, SignInWithGoogle, SignOutWithGoogle } from "./firebase/firebase.config";
import AppHeader from "./AppHeader";
import AppRoutes from "./AppRoutes";

import { Button, Container, Image, Loader, Dimmer } from "semantic-ui-react";
import "semantic-ui-css/semantic.css";
import "./index.css";
import * as logo from "./images/RenegadeLogo_transparent.png";

class App extends Component {
    constructor() {
        super();

        this.state = {
            loading: false,
            loadingMSG: "",
            userrole: null
        };

        this.showLoader = this.showLoader.bind(this);
    }

    //callback function when form editing is done.
    showLoader(isLoading, msg) {
        msg = msg || "Loading Page...";
        //console.log(isLoading, msg);

        this.setState({
            loading: isLoading,
            loadingMSG: msg
        });
    }

    componentDidMount() {
        fbauth.onAuthStateChanged(currentuser => {
            //called when logging in or out or when page is refreshed.
            if (currentuser) {
                //user is logged in
                const useremail = currentuser.email;
                let authorizedUser = false;
                let role = "";

                //check firebase db for list of approved users and compare to user who just logged in via Google Auth.
                fbUsersDB.once("value", users => {
                    users.forEach(function(u) {
                        var username = u.val().email;
                        if (username === useremail) {
                            //compare users by verified Google Email addresses.
                            authorizedUser = true;
                            role = u.val().role;
                        }
                    });

                    if (!authorizedUser) {
                        alert("User is not authorized.");
                        SignOutWithGoogle();
                    }
                    else {
                        this.setState({
                            currentuser: currentuser,
                            userrole: role
                        }); //everything is good, so set current user and role
                    }
                }); //end get users
            }
            else {
                //user logged out. reset app user state. shows login button.
                this.setState({
                    currentuser: null,
                    loading: false,
                    userrole: null
                });
            }
        }); //end auth state change
    } //componentDidMount

    SignIn() {
        this.showLoader(true, "Logging in...");
        SignInWithGoogle().then(() => {
            this.showLoader(false);
        });
    }

    render() {
        const { currentuser, isLoading, loadingMSG } = this.state;

        if (!currentuser) {
            //user is not logged in. show google logon button.
            return (
                <Container className="App" fluid>
                    <Dimmer active={isLoading}>
                        <Loader>{loadingMSG}</Loader>
                    </Dimmer>
                    <div className="login-screen">
                        <Image src={logo} />
                        <Button className="login-button" content="Sign in with Google" color="google plus" icon="google" size="large" labelPosition="left" onClick={this.SignIn.bind(this)} />
                    </div>
                </Container>
            );
        }
        else {
            //user is logged in
            return (
                <div>
                    <Container className="App" fluid>
                        <AppHeader currentuser={currentuser} />
                        <AppRoutes />
                    </Container>
                </div>
            );
        }
    } //end render
} //end class

export default App;
