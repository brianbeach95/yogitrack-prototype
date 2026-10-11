function Login({
    username,
    password,
    message,
    setUsername,
    setPassword,
    handleLogin
}) {

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-brand">
                    <img src="/images/Logo.png" alt="YogiTrack Logo" className="login-logo"/>

                    <h1>Welcome to YogiTrack</h1>
                    <p>Your all-in-one studio management companion.</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    {message && (<p className="login-message">{message}</p>)}

                    <button type="submit">
                        Login
                    </button>

                </form>

            </div>
        </div>
    )
}

export default Login