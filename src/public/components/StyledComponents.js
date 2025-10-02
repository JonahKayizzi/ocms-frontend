import tw from 'tailwind-styled-components';
import PropTypes from 'prop-types';

export function Button({
  $primary, type, btnText, btnImage,
}) {
  return (
    <button
      type={type ? 'submit' : 'button'}
      className={`
      rounded-sm w-full p-3 mt-2 flex items-center font-medium text-white md:text-lg
      ${$primary ? 'bg-skyblue justify-center hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600 transition-colors'}
    `}
    >
      <span className="text-xs font-bold text-white uppercase">{btnText}</span>
      {btnImage && <img src={btnImage} alt="Button Icon" className="rounded-xl fill-white" />}
    </button>
  );
}

const StyledInput = tw.input`
  w-full px-3 py-2 mt-2 rounded-md border border-skyblue my-3
  focus:outline-none focus:ring-1 focus:ring-skyblue
  placeholder:text-skyblue md:py-3
  font-light text-sm text-gray-800 md:text-md
`;

export function Input({
  type, placeholder, value, handleChange, id, required,
}) {
  return (
    <StyledInput
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required={required}
    />
  );
}

/**
 * Alerts and warnings
 */
export const AlertMessage = ({ alertType, message }) => {
  let alertClasses = 'w-full p-4 border mb-0 rounded-sm mx-auto';

  if (alertType === 'success') {
    alertClasses += ' bg-[#d4edda] text-[#155724] border border-[#c3e6cb]';
  } else if (alertType === 'error') {
    alertClasses += ' bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]';
  } else if (alertType === 'warning') {
    alertClasses += ' bg-[#fff3cd] text-[#856404] border border-[#ffeeba]';
  }

  const alertTypeClass = `alert-${alertType} text-center font-extralight`;

  return (
    <div className={alertClasses}>
      <div className={alertTypeClass}>
        {message}
      </div>
    </div>
  );
};

/**
 * News letter unscription container
 */
export const UnsubscriptionContainer = tw.div`
  h-[65vh] flex flex-col justify-center items-center mx-10 md:mx-20
`;

Button.propTypes = {
  $primary: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['button', 'submit']).isRequired,
  btnText: PropTypes.string.isRequired,
  btnImage: PropTypes.string,
};

Button.defaultProps = {
  btnImage: '',
};

Input.propTypes = {
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

Input.defaultProps = {
  value: '',
  required: false,
};

AlertMessage.propTypes = {
  alertType: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
