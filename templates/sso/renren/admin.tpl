<h1>RenRen Social Authentication</h1>
<hr />

<form>
	<div class="alert alert-warning">
		<p>
			Register a new <strong>renren Application</strong> via
			<a href="http://www.renren.com/">renren.com</a> and then paste
			your application details here. Your callback URL is yourdomain.com/auth/renren/callback
		</p>
		<br />
		<input type="text" data-field="social:renren:id" title="App ID" class="form-control input-lg" placeholder="App ID"><br />
		<input type="text" data-field="social:renren:secret" title="App Secret" class="form-control" placeholder="App Secret"><br />
	</div>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>
