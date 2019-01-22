import React from "react";
import history from "../modules/history";
import classnames from "classnames";
import { Icon, Menu } from "semantic-ui-react";

export default class MiniToolbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visible: false
        };

        this.ShowMenu = this.ShowMenu.bind(this);
        this.HideMenu = this.HideMenu.bind(this);
    }

    ShowMenu(ev) {
        ev.stopPropagation();
        setTimeout(() => {
            this.setState({
                visible: true
            });
        }, 100);
    }

    HideMenu(ev) {
        ev.stopPropagation();
        this.setState({
            visible: false
        });
    }

    render() {
        const { item } = this.props;
        const setArchiveStatusText = item.info.archived === "archived" ? "Unarchive" : "Archive";
        return (
            <div className="set-flag" onMouseEnter={this.ShowMenu} onMouseLeave={this.HideMenu}>
                <Menu icon borderless className="minitoolbar-switch">
                    <Menu.Item>
                        <Icon name="edit" color="grey" />
                    </Menu.Item>
                </Menu>
                <Menu icon className={classnames({ "minitoolbar-hidden": !this.state.visible }, "minitoolbar-inline")}>
                    <Menu.Item
                        name="edit"
                        title="Edit candidate"
                        className="minitoolbar-edit"
                        onClick={ev => {
                            ev.stopPropagation();
                            history.push(`/candidates/${item.key}/edit`);
                        }}>
                        <Icon link name="edit" />
                    </Menu.Item>
                    <Menu.Item name="flag" className="minitoolbar-flag" title="Add follow up note" onClick={this.props.AddNote}>
                        <Icon link name="flag" />
                    </Menu.Item>
                    <Menu.Item name="archive" className="minitoolbar-archive" title={`${setArchiveStatusText} candidate`} onClick={this.props.ArchiveCandidate}>
                        <Icon link name="archive" />
                    </Menu.Item>
                </Menu>
            </div>
        );
    }
}
