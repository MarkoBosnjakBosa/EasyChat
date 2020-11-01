import {createRouter, createWebHistory} from "vue-router";
import Registration from "../views/Registration.vue";
import Login from "../views/Login.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import ForgotUsername from "../views/ForgotUsername.vue";
import AdminOverview from "../views/AdminOverview.vue";
import Overview from "../views/Overview.vue";
import Chatroom from "../views/Chatroom.vue";
import Users from "../views/Users.vue";
import Profile from "../views/Profile.vue";

const routes = [
	{
		path: "/registration",
		name: "Registration",
		component: Registration
	},
	{
		path: "/login",
		name: "Login",
		component: Login
	},
	{
		path: "/forgot/password",
		name: "ForgotPassword",
		component: ForgotPassword
	},
	{
		path: "/reset/password/:username",
		name: "ResetPassword",
		component: ResetPassword
	},
	{
		path: "/forgot/username",
		name: "ForgotUsername",
		component: ForgotUsername
	},
	{
		path: "/admin/overview",
		name: "AdminOverview",
		component: AdminOverview
	},
	{
		path: "/overview",
		name: "Overview",
		component: Overview
	},
	{
		path: "/chatroom/:id",
		name: "Chatroom",
		component: Chatroom
	},
	{
		path: "/admin/users",
		name: "Users",
		component: Users
	},
	{
		path: "/profile",
		name: "Profile",
		component: Profile
	}
]

const router = createRouter({history: createWebHistory(process.env.BASE_URL), routes});

export default router
