package com.phantask.authentication.exception;

public class AccountDeactivatedException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public AccountDeactivatedException(String message) {
		super(message);
	}
}
