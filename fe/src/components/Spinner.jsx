import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Spinner = ({size = "large", style = {}}) => {
    const antIcon = <LoadingOutlined style={{fontSize: size === "large" ? 48 : size === "small" ? 16 : 24, color: 'var(--dark3)', ...style}} spin />;

    return (
        <div className="flex justify-center items-center h-screen">
            <Spin indicator={antIcon} />
        </div>
    );
};

export default Spinner;