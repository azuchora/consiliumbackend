const { getUser, updateUser } = require("../model/user");

const handleLogout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if(!cookies.jwt) return res.sendStatus(204);
        
        const refreshToken = cookies.jwt;
        const foundUser = await getUser({ refresh_token: refreshToken })

        if(!foundUser){
            res.clearCookie('jwt', { httpOnly: true, secure: process.env.IS_PROD === "true" });
            return res.sendStatus(204);
        }
        
        await updateUser({ id: foundUser.id }, { refresh_token: null });
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.IS_PROD === "true" });
        res.sendStatus(204);
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = handleLogout;
