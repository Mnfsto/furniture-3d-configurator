import Logo from "./Logo"

const HomeHeader = () => {
    return (
        <header className="header">
            <div className="container">
                <div className="header__logo">
                    <Logo/>
                </div>
                <nav className="header__nav">
                <ul className="menu">
                            <li className="menu__link"><a href="/">Home</a></li>
                            <li className="menu__link"><a href="/about">About</a></li>
                            <li className="menu__link"><a href="/">Shop</a></li>
                        </ul>
                    </nav>
                    <div className="header__social-links">
                        <a href="/" target="_blank"><i className="fab fa-facebook-f"><img
                            src='/icons/Facebook.svg'
                            alt='Facebook'
                            width={24}
                            height={24}
                        /></i></a>
                        <a href="/" target="_blank"><i className="fab fa-instagram"><img
                            src='/icons/Instagram.svg'
                            alt='Instagram'
                            width={24}
                            height={24}
                        /></i></a>
                    </div>

                </div>
        </header>
)
}

export default HomeHeader