using System;

namespace TOTALFISC.Shared.Models;

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public bool IsFailure => !IsSuccess;

    protected Result(bool isSuccess, string? error)
    {
        if (isSuccess && error != string.Empty && error != null)
            throw new InvalidOperationException("Success result cannot have error");
        if (!isSuccess && (error == string.Empty || error == null))
            throw new InvalidOperationException("Failure result must have error");

        IsSuccess = isSuccess;
        Error = error;
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

public class Result<T> : Result
{
    public T? Value { get; }

    protected Result(bool isSuccess, string? error, T? value) : base(isSuccess, error)
    {
        Value = value;
    }

    public static Result<T> Success(T value) => new(true, null, value);
    public static new Result<T> Failure(string error) => new(false, error, default);
}
