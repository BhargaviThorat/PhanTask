package com.phantask.notification.email;

public interface EmailService {

	void sendAccountCreationEmail(String toEmail, String username, String tempPassword);
	
}
