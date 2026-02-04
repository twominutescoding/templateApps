---
title: Role Management
description: How to configure roles and permissions
category: guide
icon: security
order: 11
---

# Role Management

This guide explains how to configure roles and permissions.

## Understanding Roles

Roles define what actions users can perform in the system. Each role is associated with:
- **Role Name** - Unique identifier (e.g., ADMIN, USER, MANAGER)
- **Application Code** - The application this role applies to
- **Description** - Human-readable description

## Viewing Roles

1. Click on **Roles** in the sidebar
2. Browse the list of configured roles
3. Use filters to search by name or application

## Creating a New Role

1. Click the **Add Role** button
2. Enter the role details:
   - Role Name (uppercase, no spaces)
   - Application Code
   - Description
3. Click **Create**

## Editing Roles

1. Find the role in the list
2. Click the **Edit** icon
3. Modify the description (name and app code cannot be changed)
4. Click **Save**

## Deleting Roles

> **Warning:** Deleting a role will remove it from all users who have it assigned.

1. Find the role in the list
2. Click the **Delete** icon
3. Confirm the deletion

## Role Hierarchy

Common role hierarchy:
- **ADMIN** - Full system access
- **MANAGER** - Can manage users and view reports
- **USER** - Basic access only

## Application-Specific Roles

Roles are scoped to applications using the Application Code:
- A user can have ADMIN role in one application and USER in another
- This allows fine-grained access control across multiple systems
