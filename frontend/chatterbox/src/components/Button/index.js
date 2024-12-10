

const Button = (props) => {
    return (
        <button className="button" onClick={props.click}>
            {props.label}
        </button>
    )    
}

export default Button