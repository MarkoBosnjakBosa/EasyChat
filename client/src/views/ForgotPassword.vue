<template>
	<div id="forgotPassword" class="container-fluid">
		<form autocomplete="off" @submit.prevent="forgotPassword()">
			<h1>Forgot password</h1>
			<div class="form-group">
				<input type="text" id="email" class="form-control" :class="{'errorField' : emailError && submitting}" placeholder="Email" v-model="email" ref="first" @focus="clearEmailStatus()" @keypress="clearEmailStatus()"/>
				<small v-if="emailError && submitting" class="form-text errorInput">Please provide a valid email!</small>
			</div>
			<div v-if="emailSent" class="form-group emailSentSuccessful">Please visit your inbox and follow suggested steps!</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">Submit</button>
			</div>
			<div class="form-group">
				<a href="#" class="btn btn-info" role="button" @click="login()">Proceed to login <i class="fas fa-hand-point-right"></i></a>
			</div>
		</form>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	var axios = require("axios");

	export default {
		name: "forgotPassword",
		data() {
			return {
				submitting: false,
				emailError: false,
				email: "",
				emailSent: false
			}
		},
		methods: {
			forgotPassword() {
				this.submitting = true;
				this.clearEmailStatus();
				if(this.invalidEmail) {
					this.emailError = true;
					this.emailSent = false;
					return;
				}
				var body = {email: this.email};
				axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/forgotPassword", body).then(response => {
					if(response.data.exists) {
						this.emailSent = true;
						this.$refs.first.focus();
						this.email = "";
						this.emailError = false, this.submitting = false;
					} else {
						this.emailError = true;
						this.emailSent = false;
					}
				}).catch(error => console.log(error));
			},
			login() {
                this.$router.push("/login");
            },
			clearEmailStatus() { this.emailError = false; }
		},
		computed: {
			invalidEmail() {
				var emailFormat = /\S+@\S+\.\S+/;
				if(this.email != "" && emailFormat.test(this.email)) {
					return false;
				} else {
					return true;
				}
			}
		}
	}
</script>

<style scoped>
	#forgotPassword {
		margin: 0 auto;
		max-width: 400px;
		text-align: center;
	}
	h1 {
		margin-top: 20px;
		margin-bottom: 20px;
	}
	.emailSentSuccessful {
		color: #008000;
		margin-bottom: 10px;
	}
	.errorField {
		border: 1px solid #ff0000;
		box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 6px #ff8080;
	}
	.errorInput {
		color: #ff0000;
	}
</style>
