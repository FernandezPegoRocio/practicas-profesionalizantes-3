
export function login(input)
{
    const userdata =
    {
        username: 'admin',
        password: '1234'
    };

    let result =
    {
        status:      false,
        result:      null,
        description: 'INVALID_USER_PASS'
    };

    if (input.username === userdata.username && input.password === userdata.password)
    {
        result = {
            status:      true,
            result:      input.username,
            description: null
        };
    }

    return result;
}