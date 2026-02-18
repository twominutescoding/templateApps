package com.template.business.auth.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.template.business.auth.dto.MailingListDTO;
import com.template.business.auth.dto.MailingListUserDTO;
import com.template.business.auth.dto.PageResponse;
import com.template.business.auth.dto.SearchRequest;
import com.template.business.auth.entity.MailingList;
import com.template.business.auth.entity.MailingListUser;
import com.template.business.auth.entity.User;
import com.template.business.auth.exception.CustomValidationException;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.ResourceNotFoundException;
import com.template.business.auth.repository.MailingListRepository;
import com.template.business.auth.repository.MailingListUserRepository;
import com.template.business.auth.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailingListAdminService {

    private final MailingListRepository mailingListRepository;
    private final MailingListUserRepository mailingListUserRepository;
    private final UserRepository userRepository;

    public List<MailingListDTO> getAllMailingLists() {
        List<MailingList> lists = mailingListRepository.findAll();
        log.info("Admin {} retrieved {} mailing lists",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                lists.size());
        return lists.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PageResponse<MailingListDTO> searchMailingLists(SearchRequest request) {
        Specification<MailingList> spec = SpecificationBuilder.buildSpecification(request);
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize(), sort);

        Page<MailingList> page = mailingListRepository.findAll(spec, pageable);
        Page<MailingListDTO> dtoPage = page.map(this::convertToDTO);

        return PageResponse.of(dtoPage);
    }

    private Sort buildSort(SearchRequest.SortInfo sortInfo) {
        if (sortInfo == null || sortInfo.getColumn() == null || sortInfo.getColumn().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "name");
        }
        Sort.Direction direction = "desc".equalsIgnoreCase(sortInfo.getOrder())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, sortInfo.getColumn());
    }

    public MailingListDTO getMailingListByName(String name) {
        MailingList mailingList = mailingListRepository.findById(name)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing list not found: " + name));

        MailingListDTO dto = convertToDTO(mailingList);
        dto.setUsers(getMailingListUsers(name));
        return dto;
    }

    @Transactional
    public MailingListDTO createMailingList(MailingListDTO dto) {
        if (mailingListRepository.existsById(dto.getName())) {
            throw new CustomValidationException("Mailing list already exists: " + dto.getName());
        }

        MailingList mailingList = new MailingList();
        mailingList.setName(dto.getName());
        mailingList.setDescription(dto.getDescription());
        mailingList.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        mailingList.setCreateDate(new Date());
        mailingList.setCreateUser(SecurityContextHolder.getContext().getAuthentication().getName());

        MailingList saved = mailingListRepository.save(mailingList);

        log.info("Admin {} created mailing list: {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                dto.getName());

        return convertToDTO(saved);
    }

    @Transactional
    public MailingListDTO updateMailingList(String name, MailingListDTO dto) {
        MailingList mailingList = mailingListRepository.findById(name)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing list not found: " + name));

        mailingList.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            mailingList.setStatus(dto.getStatus());
        }

        MailingList updated = mailingListRepository.save(mailingList);

        log.info("Admin {} updated mailing list: {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                name);

        return convertToDTO(updated);
    }

    @Transactional
    public void deleteMailingList(String name) {
        MailingList mailingList = mailingListRepository.findById(name)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing list not found: " + name));

        mailingListRepository.delete(mailingList);

        log.info("Admin {} deleted mailing list: {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                name);
    }

    public List<MailingListUserDTO> getMailingListUsers(String name) {
        if (!mailingListRepository.existsById(name)) {
            throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing list not found: " + name);
        }

        List<MailingListUser> users = mailingListUserRepository.findByIdName(name);
        return users.stream()
                .map(this::convertUserToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MailingListUserDTO addUserToMailingList(String name, String username) {
        if (!mailingListRepository.existsById(name)) {
            throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Mailing list not found: " + name);
        }

        User user = userRepository.findById(username)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User not found: " + username));

        MailingListUser.MailingListUserId id = new MailingListUser.MailingListUserId(name, username);
        if (mailingListUserRepository.existsById(id)) {
            throw new CustomValidationException("User " + username + " is already in mailing list " + name);
        }

        MailingListUser mlu = new MailingListUser();
        mlu.setId(id);
        mlu.setCreateDate(new Date());
        mlu.setCreateUser(SecurityContextHolder.getContext().getAuthentication().getName());

        MailingListUser saved = mailingListUserRepository.save(mlu);

        log.info("Admin {} added user {} to mailing list {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                username, name);

        // Reload to get user details
        saved = mailingListUserRepository.findById(id).orElse(saved);
        return convertUserToDTO(saved);
    }

    @Transactional
    public void removeUserFromMailingList(String name, String username) {
        MailingListUser.MailingListUserId id = new MailingListUser.MailingListUserId(name, username);
        if (!mailingListUserRepository.existsById(id)) {
            throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND,
                    "User " + username + " not found in mailing list " + name);
        }

        mailingListUserRepository.deleteById(id);

        log.info("Admin {} removed user {} from mailing list {}",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                username, name);
    }

    private MailingListDTO convertToDTO(MailingList mailingList) {
        int userCount = 0;
        try {
            if (mailingList.getUsers() != null) {
                userCount = mailingList.getUsers().size();
            }
        } catch (Exception e) {
            // Lazy loading may fail outside transaction
        }

        return MailingListDTO.builder()
                .name(mailingList.getName())
                .description(mailingList.getDescription())
                .status(mailingList.getStatus())
                .createDate(mailingList.getCreateDate())
                .createUser(mailingList.getCreateUser())
                .userCount(userCount)
                .build();
    }

    private MailingListUserDTO convertUserToDTO(MailingListUser mlu) {
        MailingListUserDTO.MailingListUserDTOBuilder builder = MailingListUserDTO.builder()
                .name(mlu.getId().getName())
                .username(mlu.getId().getUsername())
                .createDate(mlu.getCreateDate())
                .createUser(mlu.getCreateUser());

        if (mlu.getUser() != null) {
            builder.firstName(mlu.getUser().getFirstName())
                    .lastName(mlu.getUser().getLastName())
                    .email(mlu.getUser().getEmail());
        }

        return builder.build();
    }
}
