import React from 'react'
import ProfileDropDown from '../ProfileDropDown';
import Notification from "../Notification";

const TopRightIcons = ({ isMobileOpen }) => {

    return (
        <div>
            {!isMobileOpen && (
                <>
                    <div className="fixed top-3 right-16 z-50">
                        <Notification />
                    </div>

                    <div className="fixed top-3 right-5 z-50">
                        <ProfileDropDown imageUrl="/phanpy.png" />
                    </div>
                </>
            )}
        </div>
    )
}

export default TopRightIcons