import React, {useState, useEffect} from 'react'
import { LockOutlined, UnlockOutlined, UserOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Divider } from 'antd';
// Components
import Spinner from '../components/Spinner';
import { useNotification } from '../components/Notification';

// Api
import usersApi from '../services/usersApi';
import authApi from '../services/authentication';

export default function Login() {
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

        try {
            setLoading(true);
            const res = await authApi.login({ username, password });

            const { access_token } = res.data;
            if (access_token) {
                localStorage.setItem('token', access_token);

                const currentUser = await authApi.getCurrentUser(access_token);
                localStorage.setItem('userId', currentUser.data.id);

                setLoading(false);
                window.location.href = "/";
            } else {
                setLoading(false);
                notifier('top', { message: 'Đăng nhập thất bại!', description: 'Không nhận được mã truy cập', duration: 3 }, 'error');
            }

        } catch (error) {
            setLoading(false);
            const errorStatus = error?.response?.status;
            if (errorStatus === 403) {
                notifier('top', { message: 'Đăng nhập thất bại!', description: 'Sai tên đăng nhập hoặc mật khẩu', duration: 3 }, 'error');
            } else if (errorStatus === 404) {
                notifier('top', { message: 'Đăng nhập thất bại!', description: 'Người dùng không tồn tại', duration: 3 }, 'error');
            } else if (errorStatus === 401) {
                notifier('top', { message: 'Đăng nhập thất bại!', description: 'Phiên đăng nhập hết hạn', duration: 3 }, 'error');
            } else {
                notifier('top', { message: 'Đăng nhập thất bại!', description: 'Có lỗi xảy ra, vui lòng thử lại sau', duration: 3 }, 'error');
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
                <h2 data-aos="fade-up" className="text-3xl sm:text-4xl font-semibold text-center mt-2 mb-4 text-[var(--dark4)]">Đăng nhập</h2>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    className="w-full font-Share Tech"
                    onFinish={onFinish}
                >
                    <Form.Item
                        data-aos="fade-up"
                        data-aos-delay="200"
                        name="username"
                        rules={[{ required: true, message: 'Hãy nhập tên đăng nhập của bạn!' }]}
                    >
                        <Input prefix={<UserOutlined className="text-base" />} placeholder="Tên đăng nhập" size="large" className="w-full h-10"  />
                    </Form.Item>
                    <Form.Item
                        data-aos="fade-up"
                        data-aos-delay="400"
                        name="password"
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu của bạn!' }]}
                    >
                        <Input 
                            prefix={
                                visible ? <UnlockOutlined className="text-base" /> : <LockOutlined className="text-base" />
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
                        data-aos-delay="600"
                    >
                        <Flex justify="space-between" align="center">
                        <Form.Item
                            name="remember" 
                            valuePropName="checked" 
                            noStyle
                        >
                            <Checkbox>Nhớ mật khẩu</Checkbox>
                        </Form.Item>
                            <a className="!text-[var(--dark3)] text-sm" href="">Quên mật khẩu?</a>
                        </Flex>
                    </Form.Item>

                    <Form.Item
                        >
                        <Button 
                            data-aos="fade-up"
                            data-aos-delay="800"
                            block type="primary" 
                            htmlType="submit" 
                            size="large"
                            style={{ height: '40px', fontSize: '16px' }}
                        >
                        Đăng nhập
                        </Button>
                        <div className="text-center mt-2">
                            <Divider data-aos="fade-up" data-aos-delay="900" style={{ fontSize: '14px', marginBottom: '8px' }}>hoặc</Divider>
                            <div data-aos="fade-up" data-aos-delay="1000">
                                <a className="!text-[var(--dark2)] font-bold text-base" href="/register">Đăng ký ngay!</a>
                            </div>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}