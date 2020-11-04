<template>
	<div id="resetPassword" class="container-fluid">
		<form autocomplete="off" @submit.prevent="resetPassword()">
			<h1>Reset password</h1>
			<div class="form-group">
				<div class="input-group">
					<input type="password" id="password" class="form-control" :class="{'errorField' : passwordError && submitting}" placeholder="Password" v-model="user.password" ref="first" @focus="clearPasswordStatus()" @keypress="clearPasswordStatus()"/>
					<div class="input-group-append">
						<button type="button" class="btn btn-light" :class="{'errorIcon' : passwordError && submitting}" data-toggle="tooltip" title="Password has to have at least 8 characters, one upper and lower case, one digit and a special character." @click="togglePassword()"><i id="togglePassword" class="fa fa-eye"></i></button>
					</div>
				</div>
				<small v-if="passwordError && submitting" class="form-text errorInput">Please provide a valid password!</small>
			</div>
			<div v-if="passwordReset" class="passwordResetSuccessful">Your password has been successfully reset!</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">Submit</button>
			</div>
			<div class="form-group">
				<a href="#" class="btn btn-info" role="button" @click.prevent="login()">Proceed to login <i class="fas fa-hand-point-right"></i></a>
			</div>
		</form>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	var axios = require("axios");

	export default {
		name: "resetPassword",
		data() {
			return {
				submitting: false,
				passwordError: false,
				user: {
					username: "",
					password: ""
				},
				passwordReset: false
			}
		},
		methods: {
			login() {
				this.$router.push({name: "Login"});
			},
			resetPassword() {
				this.submitting = true;
				this.clearPasswordStatus();
				if(this.invalidPassword) {
					this.passwordError = true;
					this.passwordReset = false;
					return;
				}
				var body = {username: this.user.username, password: this.user.password};
				axios.put(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/resetPassword", body).then(response => {
					if(response.data.reset) {
						this.passwordReset = true;
						this.$refs.first.focus();
						this.user.password = "";
						this.passwordError = false, this.submitting = false;
					} else {
						this.passwordError = true;
						this.passwordReset = false;
					}
				}).catch(error => console.log(error));
			},
			clearPasswordStatus() { this.passwordError = false; },
			togglePassword() {
				var type = document.getElementById("password").getAttribute("type");
				switch(type) {
					case "password": {
						document.getElementById("password").setAttribute("type", "text");
						document.getElementById("togglePassword").classList.remove("fa-eye");
						document.getElementById("togglePassword").classList.add("fa-eye-slash");
						return;
					}
					case "text": {
						document.getElementById("password").setAttribute("type", "password");
						document.getElementById("togglePassword").classList.remove("fa-eye-slash");
						document.getElementById("togglePassword").classList.add("fa-eye");
						return;
					}
				}
			}
		},
		computed: {
			invalidPassword() {
				var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
				if(this.user.password != "" && passwordFormat.test(this.user.password)) {
					return false;
				} else {
					return true;
				}
			}
		},
		created() {
			this.user.username = this.$route.params.username;
		}
	}
</script>

<style scoped>
	#resetPassword {
		margin: 0 auto;
		max-width: 400px;
		text-align: center;
	}
	h1 {
		margin-top: 20px;
		margin-bottom: 20px;
	}
	.passwordResetSuccessful {
		color: #008000;
		margin-bottom: 10px;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorIcon {
		border: 1px solid #ff0000;
		border-left: 0px;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
	}
</style>
