package com.template.business.auth.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.template.business.auth.dto.MailingCreateRequest;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.util.SpecificationBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.template.business.auth.dto.MailingDTO;
import com.template.business.auth.entity.Mailing;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.MailingRepository;

/**
 * Service for mailing administration (read-only) (ADMIN only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailingAdminService {

    private final MailingRepository mailingRepository;

    /**
     * Get all mailings
     */
    public List<MailingDTO> getAllMailings() {
        List<Mailing> mailings = mailingRepository.findAll();
        log.info("Admin {} retrieved {} mailings",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                mailings.size());
        return mailings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search mailings with pagination, filtering, and sorting
     */
    public PageResponse<MailingDTO> searchMailings(SearchRequest request) {
        Specification<Mailing> spec = SpecificationBuilder.buildSpecification(request);
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize(), sort);

        Page<Mailing> page = mailingRepository.findAll(spec, pageable);
        Page<MailingDTO> dtoPage = page.map(this::convertToDTO);

        return PageResponse.of(dtoPage);
    }

    private Sort buildSort(SearchRequest.SortInfo sortInfo) {
        if (sortInfo == null || sortInfo.getColumn() == null || sortInfo.getColumn().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createDate");
        }
        Sort.Direction direction = "desc".equalsIgnoreCase(sortInfo.getOrder())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, sortInfo.getColumn());
    }

    /**
     * Get mailing by ID
     */
    public MailingDTO getMailingById(Long id) {
        Mailing mailing = mailingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing not found: " + id));
        return convertToDTO(mailing);
    }

    /**
     * Create a new mailing record in the queue
     */
    public MailingDTO createMailing(MailingCreateRequest request) {
        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        Mailing mailing = new Mailing();
        mailing.setSubject(request.getSubject());
        mailing.setBody(request.getBody());
        mailing.setAttachment(request.getAttachment());
        mailing.setMailingList(request.getMailingList());
        mailing.setMailType(request.getMailType());
        mailing.setNotBefore(request.getNotBefore() != null ? request.getNotBefore() : new Date());
        mailing.setSent("N");
        mailing.setCreateDate(new Date());
        mailing.setCreateUser(currentUser);

        Mailing saved = mailingRepository.save(mailing);
        log.info("Admin {} created mailing ID={} for list '{}'", currentUser, saved.getId(), saved.getMailingList());
        return convertToDTO(saved);
    }

    /**
     * Resend a mailing by resetting its SENT flag to 'N'
     */
    public MailingDTO resendMailing(Long id) {
        Mailing mailing = mailingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing not found: " + id));

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        mailing.setSent("N");
        mailing.setNotBefore(new Date());
        Mailing saved = mailingRepository.save(mailing);
        log.info("Admin {} triggered resend for mailing ID={}", currentUser, id);
        return convertToDTO(saved);
    }

    /**
     * Convert mailing entity to DTO
     */
    private MailingDTO convertToDTO(Mailing mailing) {
        return MailingDTO.builder()
                .id(mailing.getId())
                .subject(mailing.getSubject())
                .body(mailing.getBody())
                .attachment(mailing.getAttachment())
                .sent(mailing.getSent())
                .notBefore(mailing.getNotBefore())
                .mailingList(mailing.getMailingList())
                .mailType(mailing.getMailType())
                .createDate(mailing.getCreateDate())
                .createUser(mailing.getCreateUser())
                .build();
    }
}
