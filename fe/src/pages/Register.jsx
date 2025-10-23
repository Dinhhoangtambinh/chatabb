import React, { useState, useEffect } from 'react'
import { LockOutlined, UnlockOutlined, UserOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Divider } from 'antd';
// Components
import Spinner from '../components/Spinner';
import { useNotification } from '../components/Notification';

// Api
import usersApi from '../services/usersApi';
import authApi from '../services/authentication';

export default function Register() {
    const notifier = useNotification();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const toggleIcon = (
        <span
        onClick={() => setVisible(!visible)}
        className="cursor-pointer"
        >
        {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        </span>
    )

    const onFinish = async (values) => {
        const username = values.username;
        const password = values.password;
        let displayName = "";
        try {
            setLoading(true);
            const data = { username, password };
            const res = await authApi.register(data);

            const respUsername = res?.data?.username || res?.data?.user?.username || username;

            if (respUsername && respUsername.trim().length > 1) {
                const parts = respUsername.trim().split(" ");
                displayName = parts[parts.length - 1];
                localStorage.setItem('displayName', displayName);
            }

            notifier('top', { message: 'Đăng ký thành công', description: `Chào mừng, ${displayName || username}. Hãy đăng nhập!` }, 'success');
            setTimeout(() => {
                setLoading(false);
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            setLoading(false);
            const errorStatus = error?.response?.status;
            if (errorStatus === 409) {
                notifier('top', { message: 'Đăng ký thất bại', description: 'Tên đăng nhập đã tồn tại, vui lòng chọn tên khác' }, 'error');
            }
            else {
                notifier('top', { message: 'Đăng ký thất bại', description: error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau' }, 'error');
            }
        }
    }

    if (loading) {
        return <Spinner />;
    }

    return (
        <div
            className = "relative flex items-center justify-center min-h-screen bg-[var(--mainBg)]" // Màu nền
        >
            {/* <img src="/earth2.png" alt="Logo" className="absolute top-2 w-full" /> */}
            <div
                className="
                    w-[90%]
                    max-w-md
                    p-4 sm:p-6 
                    bg-[var(--subBg)] rounded-xl shadow-lg
                    relative z-10
                " // Màu nền
            >
                <h2 data-aos="fade-up" className="text-3xl sm:text-4xl font-semibold text-center mt-2 mb-4 text-[var(--dark4)]">Đăng ký</h2>
                <Form
                    name="register"
                    initialValues={{ remember: true }}
                    className="w-full font-Share Tech"
                    onFinish={onFinish}
                >
                    <Form.Item
                        data-aos="fade-up"
                        data-aos-delay="400"
                        name="username"
                        rules={[{ required: true, message: 'Hãy nhập tên đăng nhập của bạn!' }]}
                    >
                        <Input prefix={<UserOutlined className="text-base"/>} placeholder="Tên đăng nhập" size="large" className="w-full h-10"/>
                    </Form.Item>
                    <Form.Item
                        data-aos="fade-up"
                        data-aos-delay="600"
                        name="password"
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu của bạn!' }]}
                        hasFeedback
                    >
                        <Input 
                            prefix={
                                visible ? <UnlockOutlined className="text-base"/> : <LockOutlined className="text-base" />
                            } 
                            type={visible ? "text" : "password"}
                            placeholder="Mật khẩu" 
                            size="large" 
                            suffix={toggleIcon}
                            className="w-full h-10"
                        />
                    </Form.Item>
                    <Form.Item
                        data-aos="fade-up"
                        data-aos-delay="800"
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                        {
                            required: true,
                            message: 'Hãy xác nhận mật khẩu của bạn!',
                        },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Password từ trên nhập xuống mà cũng sai ??'));
                                },
                            }),
                        ]}
                    >
                        <Input 
                            prefix={
                                visible ? <UnlockOutlined className="text-base"/> : <LockOutlined className="text-base" />
                            } 
                            type={visible ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu" 
                            size="large" 
                            suffix={toggleIcon}
                            className="w-full h-10"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button data-aos="fade-up" data-aos-delay="1000" block type="primary" htmlType="submit" size="large" style={{ height: '40px', fontSize: '16px' }}>
                            Đăng ký
                        </Button>
                        <div className="text-center mt-2">
                            <Divider data-aos="fade-up" data-aos-delay="1100" style={{ fontSize: '14px', marginBottom: '8px' }}> hoặc </Divider>
                            <div data-aos="fade-up" data-aos-delay="1200">
                                <a className="!text-[var(--dark2)] font-bold text-base" href="/login"> Đăng nhập </a>
                            </div>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}