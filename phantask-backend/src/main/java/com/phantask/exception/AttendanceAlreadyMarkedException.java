package com.phantask.exception;

public class AttendanceAlreadyMarkedException extends RuntimeException {

	private static final long serialVersionUID = -427389909691781374L;

	public AttendanceAlreadyMarkedException(String message) {
        super(message);
    }
}
