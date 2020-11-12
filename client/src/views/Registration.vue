<template>
	<div id="registration" class="container-fluid">
		<form autocomplete="off" @submit.prevent="createUser()" enctype="multipart/form-data">
			<h1>Register</h1>
			<div class="form-row">
				<div class="form-group col-md-4">
					<div class="avatarDiv">
						<div id="previewAvatar">
							<img src="../assets/defaultAvatar.jpg" alt="Avatar" class="rounded-circle" width="100" height="100">
						</div>
						<div class="avatarWrapper">
							<button class="avatarUpload" :class="{'errorField' : avatarError && submitting}">Upload avatar <i class="fas fa-upload"></i></button>
							<input type="file" id="avatar" @change="selectAvatar($event)"/>
						</div>
						<small v-if="avatarError && submitting" class="form-text errorInput" style="text-align: center">Please provide a valid avatar!</small>
					</div>
				</div>
				<div class="form-group col-md-6">
					<div class="form-group">
						<input type="text" id="username" class="form-control" :class="{'errorField' : usernameError && submitting}" placeholder="Username" v-model="user.username" ref="first" @focus="clearUsernameStatus()" @keypress="clearUsernameStatus()"/>
						<small v-if="usernameError && submitting" class="form-text errorInput">Please provide a valid username!</small>
					</div>
					<div class="form-group">
						<input type="text" id="email" class="form-control" :class="{'errorField' : emailError && submitting}" placeholder="Email" v-model="user.email" @focus="clearEmailStatus()" @keypress="clearEmailStatus()"/>
						<small v-if="emailError && submitting" class="form-text errorInput">Please provide a valid email!</small>
					</div>
					<div class="form-group">
						<div class="input-group">
							<input type="password" id="password" class="form-control" :class="{'errorField' : passwordError && submitting}" placeholder="Password" v-model="user.password" @focus="clearPasswordStatus()" @keypress="clearPasswordStatus()"/>
							<div class="input-group-append">
								<button type="button" class="btn btn-light" :class="{'errorIcon' : passwordError && submitting}" data-toggle="tooltip" title="Password has to have at least 8 characters, one upper and lower case, one digit and a special character." @click="togglePassword()"><i id="togglePassword" class="fa fa-eye"></i></button>
							</div>
						</div>
						<small v-if="passwordError && submitting" class="form-text errorInput">Please provide a valid password!</small>
					</div>
					<div class="form-group">
						<input type="text" id="firstName" class="form-control" :class="{'errorField' : firstNameError && submitting}" placeholder="First name" v-model="user.firstName" @focus="clearFirstNameStatus()" @keypress="clearFirstNameStatus()"/>
						<small v-if="firstNameError && submitting" class="form-text errorInput">Please provide a valid first name!</small>
					</div>
					<div class="form-group">
						<input type="text" id="lastName" class="form-control" :class="{'errorField' : lastNameError && submitting}" placeholder="Last name" v-model="user.lastName" @focus="clearLastNameStatus()" @keypress="clearLastNameStatus()"/>
						<small v-if="lastNameError && submitting" class="form-text errorInput">Please provide a valid last name!</small>
					</div>
					<div v-if="userCreated" class="form-group creationSuccessful">
						<div>User has been successfully created!</div>
						<div>Please visit your inbox and confirm your registration!</div>
					</div>
					<div v-if="alreadyExists == 'username'" class="form-group creationFailed">Username already exists!</div>
					<div v-if="alreadyExists == 'email'" class="from-group creationFailed">Email already exists!</div>
					<div class="form-group">
						<button type="submit" class="btn btn-primary">Submit</button>
						<button type="button" class="btn btn-danger resetForm" @click="resetForm()">Reset</button>
					</div>
					<div class="form-group">
						<a href="#" class="btn btn-info" role="button" @click="login">Proceed to login <i class="fas fa-hand-point-right"></i></a>
					</div>
				</div>
			</div>
		</form>
	</div>
</template>

<script>
	import "bootstrap";
	import "bootstrap/dist/css/bootstrap.min.css";
	var axios = require("axios");

	export default {
		name: "registration",
		data() {
			return {
				submitting: false,
				usernameError: false,
				emailError: false,
				passwordError: false,
				firstNameError: false,
				lastNameError: false,
				avatarError: false,
				user: {
					username: "",
					email: "",
					password: "",
					firstName: "",
					lastName: "",
					avatar: ""
				},
				userCreated: false,
				alreadyExists: ""
			}
		},
		methods: {
			createUser() {
				this.submitting = true;
				this.clearUsernameStatus();
				this.clearEmailStatus();
				this.clearPasswordStatus();
				this.clearFirstNameStatus();
				this.clearLastNameStatus();
				this.clearAvatarStatus();
				var allowSubmit = true;
				if(this.invalidUsername) {
					this.usernameError = true;
					allowSubmit = false;
				}
				if(this.invalidEmail) {
					this.emailError = true;
					allowSubmit = false;
				}
				if(this.invalidPassword) {
					this.passwordError = true;
					allowSubmit = false;
				}
				if(this.invalidFirstName) {
					this.firstNameError = true;
					allowSubmit = false;
				}
				if(this.invalidLastName) {
					this.lastNameError = true;
					allowSubmit = false;
				}
				if(this.invalidAvatar) {
					this.avatarError = true;
					allowSubmit = false;
				}
				if(!allowSubmit) {
					this.alreadyExists = "";
					this.userCreated = false;
					return;
				}
				var formData = new FormData();
				formData.append("username", this.user.username);
				formData.append("email", this.user.email);
				formData.append("password", this.user.password);
				formData.append("firstName", this.user.firstName);
				formData.append("lastName", this.user.lastName);
				formData.append("avatar", this.user.avatar);
				axios.post(process.env.VUE_APP_BASE_URL + process.env.VUE_APP_SERVER_PORT + "/createUser", formData).then(response => {
					if(response.data.created) {
						this.userCreated = true;
						this.$refs.first.focus();
						this.user = {username: "", email: "", password: "", firstName: "", lastName: "", avatar: ""};
						document.getElementById("avatar").value = "";
						document.getElementById("previewAvatar").innerHTML = "<img src='" + require("../assets/defaultAvatar.jpg") + "' alt='Avatar' class='rounded-circle' width='100' height='100'>";
						this.alreadyExists = "";
						this.usernameError = false, this.emailError = false, this.passwordError = false, this.firstNameError = false, this.lastNameError = false, this.avatarError = false, this.submitting = false;
					} else {
						if(response.data.alreadyExists) {
							this.alreadyExists = response.data.field;
							this.userCreated = false;
						} else {
							var errorFields = response.data.errorFields;
							if(errorFields.includes("username")) this.usernameError = true;
							if(errorFields.includes("email")) this.emailError = true;
							if(errorFields.includes("password")) this.passwordError = true;
							if(errorFields.includes("firstName")) this.firstNameError = true;
							if(errorFields.includes("lastName")) this.lastNameError = true;
							if(errorFields.includes("avatar")) this.avatarError = true;
							this.alreadyExists = "";
							this.userCreated = false;
						}
					}
				}).catch(error => console.log(error));
			},
			login() {
				this.$router.push("/login");
			},
			clearUsernameStatus() { this.usernameError = false; },
			clearEmailStatus() { this.emailError = false; },
			clearPasswordStatus() { this.passwordError = false; },
			clearFirstNameStatus() { this.firstNameError = false; },
			clearLastNameStatus() { this.lastNameError = false; },
			clearAvatarStatus() { this.avatarError = false; },
			selectAvatar(event) {
				this.submitting = false;
				var files = event.target.files;
				var allowedExtensions = ["image/png", "image/jpg", "image/jpeg"];
				if(files && files.length && allowedExtensions.includes(files[0].type) && files[0].size <= 500000) {
					var file = files[0];
					var reader = new FileReader();
					reader.onload = function(e) {
						var previewAvatar = document.getElementById("previewAvatar");
						previewAvatar.innerHTML = "<div><img src='" + e.target.result + "' alt='" + file.name + "' class='rounded-circle' width='100' height='100'></div><div>" + file.name + "</div>";
					}
					this.user.avatar = file;
					this.clearAvatarStatus();
					reader.readAsDataURL(file);
				} else {
					this.avatarError = true;
					this.submitting = true;
				}
			},
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
			},
			resetForm() {
				this.user = {username: "", email: "", password: "", firstName: "", lastName: "", avatar: ""};
				document.getElementById("avatar").value = "";
				document.getElementById("previewAvatar").innerHTML = "<img src='" + require("../assets/defaultAvatar.jpg") + "' alt='Avatar' class='rounded-circle' width='100' height='100'>";
				this.alreadyExists = "";
				this.usernameError = false, this.emailError = false, this.passwordError = false, this.firstNameError = false, this.lastNameError = false, this.avatarError = false, this.userCreated = false, this.submitting = false;
			}
		},
		computed: {
			invalidUsername() { 
				var usernameFormat = /^[a-z0-9_.-]*$/;
				if(this.user.username != "" && usernameFormat.test(this.user.username)) {
					return false;
				} else {
					return true;
				}
			},
			invalidEmail() {
				var emailFormat = /\S+@\S+\.\S+/;
				if(this.user.email != "" && emailFormat.test(this.user.email)) {
					return false;
				} else {
					return true;
				}
			},
			invalidPassword() {
				var passwordFormat = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
				if(this.user.password != "" && passwordFormat.test(this.user.password)) {
					return false;
				} else {
					return true;
				}
			},
			invalidFirstName() { return this.user.firstName === ""; },
			invalidLastName() { return this.user.lastName === ""; },
			invalidAvatar() { return this.user.avatar === ""; }
		}
	}
</script>

<style scoped>
	#registration {
		margin: 0 auto;
		max-width: 800px;
	}
	h1 {
		text-align: center;
		margin-top: 20px;
		margin-bottom: 20px;
	}
	.avatarDiv {
		margin: 0 auto;
		margin-top: 50px;
	}
	#previewAvatar {
		text-align: center;
		margin-bottom: 10px;
	}
	.avatarWrapper {
		position: relative;
		overflow: hidden;
		display: inline-block;
	}
	.avatarUpload {
		border: 2px solid #808080;
		color: #808080;
		background-color: #fff;
		padding: 8px 20px;
		border-radius: 8px;
		font-size: 20px;
		font-weight: bold;
		margin-left: 30px;
	}
	#avatar {
		opacity: 0;
		position: absolute;
		left: 0px;
		top: 0px;
		font-size: 100px;
	}
	.resetForm {
		margin-left: 10px;
	}
	.creationSuccessful {
		color: #008000;
		margin-bottom: 10px;
	}
	.creationFailed {
		color: #ff0000;
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
