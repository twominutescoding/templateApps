package com.template.business.auth.service;

import com.template.business.auth.entity.Mailing;
import com.template.business.auth.entity.MailingListUser;
import com.template.business.auth.entity.User;
import com.template.business.auth.repository.MailingListUserRepository;
import com.template.business.auth.repository.MailingRepository;
import com.template.business.auth.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Scheduler service that processes the T_MAILING queue.
 * Finds unsent records where NOT_BEFORE <= now, resolves mailing lists to email addresses,
 * and sends via JavaMailSender (SMTP).
 *
 * Only active when mailing.scheduler.enabled=true.
 * Oracle's PK_MAILING package remains as an independent fallback.
 */
@Service
@ConditionalOnProperty(name = "mailing.scheduler.enabled", havingValue = "true")
public class MailingSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(MailingSchedulerService.class);

    private final MailingRepository mailingRepository;
    private final MailingListUserRepository mailingListUserRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${mailing.scheduler.from-address:noreply@example.com}")
    private String fromAddress;

    public MailingSchedulerService(MailingRepository mailingRepository,
                                   MailingListUserRepository mailingListUserRepository,
                                   UserRepository userRepository,
                                   JavaMailSender mailSender) {
        this.mailingRepository = mailingRepository;
        this.mailingListUserRepository = mailingListUserRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        log.info("Mailing scheduler initialized with from-address: {}", fromAddress);
    }

    @Scheduled(fixedDelayString = "${mailing.scheduler.interval:60000}")
    public void processMailingQueue() {
        List<Mailing> pendingMailings = mailingRepository.findBySentAndNotBeforeLessThanEqual("N", new Date());

        if (pendingMailings.isEmpty()) {
            return;
        }

        log.info("Processing {} pending mailing(s)", pendingMailings.size());

        for (Mailing mailing : pendingMailings) {
            processSingleMailing(mailing);
        }
    }

    private void processSingleMailing(Mailing mailing) {
        try {
            // Resolve mailing list name -> usernames
            List<MailingListUser> listUsers = mailingListUserRepository.findByIdName(mailing.getMailingList());

            if (listUsers.isEmpty()) {
                log.warn("Mailing ID={}: mailing list '{}' has no users. Marking as sent.",
                        mailing.getId(), mailing.getMailingList());
                markAsSent(mailing);
                return;
            }

            // Resolve usernames -> email addresses
            List<String> emails = listUsers.stream()
                    .map(mlu -> mlu.getId().getUsername())
                    .map(userRepository::findByUsername)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(User::getEmail)
                    .filter(email -> email != null && !email.isBlank())
                    .distinct()
                    .collect(Collectors.toList());

            if (emails.isEmpty()) {
                log.warn("Mailing ID={}: no valid email addresses found for list '{}'. Marking as sent.",
                        mailing.getId(), mailing.getMailingList());
                markAsSent(mailing);
                return;
            }

            // Send email
            sendEmail(mailing, emails);
            markAsSent(mailing);
            log.info("Mailing ID={}: sent successfully to {} recipient(s)", mailing.getId(), emails.size());

        } catch (Exception e) {
            log.error("Mailing ID={}: failed to send - {}. Will retry next run.",
                    mailing.getId(), e.getMessage(), e);
            // Leave SENT='N' so it will be retried on next scheduler run
        }
    }

    private void sendEmail(Mailing mailing, List<String> recipients) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        boolean isHtml = mailing.getMailType() != null
                && mailing.getMailType().toUpperCase().contains("HTML");

        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(recipients.toArray(new String[0]));
        helper.setSubject(mailing.getSubject());
        helper.setText(mailing.getBody() != null ? mailing.getBody() : "", isHtml);

        mailSender.send(message);
    }

    private void markAsSent(Mailing mailing) {
        mailing.setSent("Y");
        mailingRepository.save(mailing);
    }
}
