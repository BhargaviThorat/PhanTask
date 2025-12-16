package com.phantask.notification.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendAccountCreationEmail(String toEmail, String username, String tempPassword) {

    	log.info("Sending account creation mail to {}", toEmail);
    	
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your Phantask Account Has Been Created");

        message.setText("""
                Hello,

                Your account has been successfully created.

                Username: %s
                Temporary Password: %s

                Please re-login and change your password to gohead.

                Regards,
                Phantask Team
                """.formatted(username, tempPassword));

        mailSender.send(message);

        log.info("Account creation email sent to {}", toEmail);
    }
}

