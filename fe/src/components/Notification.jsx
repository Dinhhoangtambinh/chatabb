import React, { createContext, useContext } from "react";
import { notification } from "antd";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [api, contextHolder] = notification.useNotification();

    const notifier = (placement, options = {}, type = "info") => {
        api[type]({
        message: options.message || 'Thông báo',
        description:
            options.description || 'Có lỗi xảy ra, ai fix dùm TB đi :(',
        placement,
        duration: options.duration || 2,
        showProgress: true,
        });
    };

    return (
        <NotificationContext.Provider value={notifier}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return ctx;
};
